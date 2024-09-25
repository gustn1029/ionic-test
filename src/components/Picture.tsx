import {
  Camera,
  CameraResultType,
  CameraSource,
  GalleryPhoto,
} from "@capacitor/camera";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonList,
  IonPage,
} from "@ionic/react";
import { closeCircleOutline } from "ionicons/icons";
import React, { useState } from "react";
import "./picture.css";

interface PhotoProps extends GalleryPhoto {
  id: number;
}

const Picture = () => {
  const [photos, setPhotos] = useState<PhotoProps[]>([]);

  const pickImages = async () => {
    try {
      const result = await Camera.pickImages({
        quality: 90,
        limit: 10,
      });

      if (photos.length + result.photos.length > 10) {
        alert("이미지는 최대 10개 이하로 선택 가능합니다.");
        return;
      }

      const newPhotos = result.photos.map((el) => ({
        ...el,
        id: Date.now() + Math.random(),
      }));
      setPhotos((prevPhotos) => {
        const combinedPhotos = [...prevPhotos, ...newPhotos];
        const uniquePhotos = combinedPhotos.filter(
          (photo, index, self) =>
            index === self.findIndex((t) => t.webPath === photo.webPath)
        );
        return uniquePhotos.slice(0, 10);
      });

      for (const photo of result.photos) {
        console.log("Image path:", photo);
      }
    } catch (error) {
      console.error("이미지 선택 중 오류 발생:", error);
    }
  };

  const removePhotoHandler = (id: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== id));
  };
  return (
    <div>
      <IonPage className="wrap">
        <IonContent>
          <IonButton onClick={pickImages}>이미지 선택</IonButton>
          <IonList className="list">
            {photos.map((photo, index) => (
              <IonItem key={index} className="item">
                <img src={photo.webPath} alt={`Selected image ${index + 1}`} />
                <IonButton onClick={() => removePhotoHandler(photo.id)}>
                  <IonIcon icon={closeCircleOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonPage>
    </div>
  );
};

export default Picture;
