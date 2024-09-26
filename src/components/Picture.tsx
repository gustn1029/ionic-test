import React, { useState, useRef } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonPage,
  useIonToast,
  isPlatform,
  IonLabel
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { closeCircleOutline, camera } from "ionicons/icons";
import "./picture.css";

interface CustomPhoto {
  webPath?: string;
  format?: string;
  resizedWebPath?: string;
}

interface ImageSize {
  original: string;
  resized: string;
}

const Picture: React.FC = () => {
  const [photo, setPhoto] = useState<CustomPhoto | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [present] = useIonToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: Blob, targetSize: number = 224, quality: number = 0.9): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        const scale = Math.max(targetSize / img.width, targetSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const checkPermissions = async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      const permission = await Camera.checkPermissions();
      if (permission.camera !== 'granted') {
        const request = await Camera.requestPermissions();
        if (request.camera !== 'granted') {
          throw new Error('카메라 권한이 필요합니다.');
        }
      }
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      if (isPlatform('hybrid')) {
        await checkPermissions();
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Prompt
        });
        await processImage(image);
      } else {
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.error("이미지 선택 중 오류 발생:", error);
      present({
        message: `이미지 선택 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          await processImage({ webPath: result, format: 'jpeg' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (image: CustomPhoto): Promise<void> => {
    if (image.webPath) {
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const originalSize = formatSize(blob.size);
      console.log("Original image size:", originalSize);

      const resizedBlob = await resizeImage(blob, 224, 0.9);
      const resizedSize = formatSize(resizedBlob.size);
      console.log("Resized image size:", resizedSize);

      const resizedWebPath = URL.createObjectURL(resizedBlob);

      setPhoto({
        ...image,
        resizedWebPath,
      });

      setImageSize({
        original: originalSize,
        resized: resizedSize
      });

      console.log("Resized Image path:", resizedWebPath);
      present({
        message: '이미지가 성공적으로 선택되었습니다.',
        duration: 2000,
        position: 'bottom'
      });
    } else {
      throw new Error('이미지 경로를 가져올 수 없습니다.');
    }
  };

  const removePhoto = (): void => {
    setPhoto(null);
    setImageSize(null);
    present({
      message: '이미지가 제거되었습니다.',
      duration: 2000,
      position: 'bottom'
    });
  };

  return (
    <IonPage className="wrap">
      <IonContent>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleFileInput}
        />
        <IonButton onClick={pickImage}>
          <IonIcon icon={camera} slot="start" />
          {photo ? '이미지 변경' : '이미지 선택'}
        </IonButton>
        {photo && photo.resizedWebPath && (
          <IonItem className="item">
            <img src={photo.resizedWebPath} alt="Selected image" style={{ width: '224px', height: '224px', objectFit: 'cover' }} />
            <IonButton onClick={removePhoto}>
              <IonIcon icon={closeCircleOutline} />
            </IonButton>
          </IonItem>
        )}
        {imageSize && (
          <IonItem>
            <IonLabel>
              원본 이미지 크기: {imageSize.original}<br />
              변환된 이미지 크기: {imageSize.resized}
            </IonLabel>
          </IonItem>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Picture;