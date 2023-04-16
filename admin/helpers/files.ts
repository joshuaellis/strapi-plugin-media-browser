import { notify } from '../components/Notifications';
import { MediaFile } from '../data/fileApi';
import axios from '../utils/axiosInstance';

export const filterFilesFromDropzone = async (fileList: FileList) => {
  const files = Array.from(fileList);

  const filteredFiles: File[] = [];

  for (const file of files) {
    try {
      await file.slice(0, 1).arrayBuffer();
      filteredFiles.push(file);
    } catch (err) {
      // do nothing: file is a package or folder
      // TODO: consider looking at whether someone _should_ be able to upload a folder?
    }
  }

  return filteredFiles;
};

const readFile = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });

const hexFromBuffer = (buffer: ArrayBuffer): string => {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => `00${x.toString(16)}`.slice(-2))
    .join('');
};

export const hashFile = async (file: File) => {
  if (!window.crypto || !window.crypto.subtle || !window.FileReader) {
    throw new Error('This browser does not support hashing files. Please use a modern browser.');
  }

  const fileBuffer = await readFile(file);

  const buffer = await window.crypto.subtle.digest('SHA-1', fileBuffer);

  return hexFromBuffer(buffer);
};

export const downloadFile = async (file: MediaFile) => {
  try {
    /**
     * Get the _actual_ file from the server as a blob
     */
    const response = await axios.get(file.url, {
      responseType: 'blob',
    });

    if ('data' in response) {
      /**
       * Create the blob and object URL
       * Create a link and click it to download the file
       * Revoke the object URL and the anchor
       */
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if ('error' in response) {
      throw response.error;
    }
  } catch (err) {
    console.error(err);

    notify({
      status: 'error',
      title: 'There was an issue downloading',
      description: `${file.name} was unable to be downloaded`,
    });
  }
};
