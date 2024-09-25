import { IonButton } from '@ionic/react';
import './ExploreContainer.css';

interface ContainerProps { }

const ExploreContainer: React.FC<ContainerProps> = () => {
  return (
    <div id="container">
      <IonButton routerLink="/picture">picture</IonButton>
    </div>
  );
};

export default ExploreContainer;
