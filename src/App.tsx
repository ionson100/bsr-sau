import React from 'react';
import AvatarUploader from "./avatar";
import './avatar/index.css'

function App() {
  return (
    <div style={{background:"#b4abab"}} >
     <AvatarUploader canvasSize={200} serverError={(s)=>{
         alert(s)
     }}  />
    </div>
  );
}

export default App;
