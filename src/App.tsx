import { useState, useRef } from 'react';
import { Video, StopCircle, Upload, CheckCircle } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiResponse, setApiResponse] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setUploadSuccess(false);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const uploadVideo = async () => {
    if (!recordedBlob || !apiUrl) {
      alert('Vui lòng nhập URL API để upload video');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('video', recordedBlob, 'recording.webm');

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadSuccess(true);
        setApiResponse(data.message || JSON.stringify(data, null, 2));
        alert('Upload video thành công!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Lỗi khi upload video. Vui lòng kiểm tra lại URL API.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Video Recording Form</h1>
            <p className="text-blue-100 mt-2">Quay video và upload lên server của bạn</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Video Preview */}
            <div className="mb-8">
              <div className="relative bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls={!isRecording && recordedBlob !== null}
                  playsInline
                />

                {!isRecording && !recordedBlob && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Nhấn nút bên dưới để bắt đầu quay</p>
                    </div>
                  </div>
                )}

                {isRecording && (
                  <>
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full" />
                      <span className="font-semibold">Đang quay</span>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <StopCircle className="w-5 h-5" />
                        Dừng quay
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recording Controls */}
            {!isRecording && (
              <div className="flex gap-4 mb-8">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Video className="w-5 h-5" />
                  Bắt đầu quay video
                </button>
              </div>
            )}

            {/* Upload Section */}
            {recordedBlob && !isRecording && (
              <div className="border-t pt-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Upload Video</h2>

                <div className="mb-4">
                  <label htmlFor="apiUrl" className="block text-sm font-medium text-slate-700 mb-2">
                    API URL
                  </label>
                  <input
                    id="apiUrl"
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://your-api.com/upload"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={uploadVideo}
                  disabled={isUploading || !apiUrl}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang upload...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Upload thành công
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload video
                    </>
                  )}
                </button>

                {uploadSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-center font-medium">
                      ✓ Video đã được upload thành công!
                    </p>
                  </div>
                )}

                {apiResponse && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phản hồi từ API
                    </label>
                    <textarea
                      value={apiResponse}
                      readOnly
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Nhấn "Bắt đầu quay video" và cấp quyền truy cập camera</li>
            <li>• Nhấn "Dừng quay" khi hoàn tất</li>
            <li>• Nhập URL API của bạn vào ô bên dưới</li>
            <li>• Nhấn "Upload video" để gửi file lên server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
