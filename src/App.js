import React, { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone'
import { ipcRenderer } from 'electron';

const TOP_ROW_SPACING = 24;

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  margin: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#ababab',
  borderStyle: 'dashed',
  backgroundColor: '#1a1a1a',
  color: '#ababab',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer'
};

const img = {
  display: 'block',
  width: '-webkit-fill-available',
  height: '100%',
  opacity: '0.5'
};

const activeStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

function App() {
  const [file, setFile] = useState([]);
  const [showDropArea, setShowDropArea] = useState(true);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: 'image/*',
    onDrop: acceptedFiles => {
      const preview = URL.createObjectURL(acceptedFiles[0]);
      setFile(Object.assign(acceptedFiles[0], { preview }));

      let img = new Image();
      img.src = preview;

      setShowDropArea(false);

      img.onload = () => {
        ipcRenderer.send('resize-main-window', {
          height: img.height + TOP_ROW_SPACING,
          width: img.width,
        });
      };

      document.body.style.background = 'transparent';
    }
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  ipcRenderer.on('resize', (event, arg) => {
    const image = document.getElementById('image');
    ipcRenderer.send('resize-main-window', {
      height: image.offsetHeight + TOP_ROW_SPACING,
      width: image.offsetWidth,
    });
  });

  useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    URL.revokeObjectURL(file.preview);
  }, [file]);

  return (
    <>
      <header id="titlebar"></header>
      {showDropArea && 
        <div {...getRootProps({style})}>
          <input {...getInputProps()} />
          <p>Drop an image here</p>
        </div>
      }
      <img
        id="image"
        src={file.preview}
        style={img}
      />
    </>
  )
}

export default App;