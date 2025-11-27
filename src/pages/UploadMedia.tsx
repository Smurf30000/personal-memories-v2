import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/feature/authentication/model/AuthContext';
import { useMediaUpload } from '@/feature/media/controller/useMediaUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react';

/**
 * Upload media page component
 */
export default function UploadMedia() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { uploads, uploadFiles, clearCompleted } = useMediaUpload(user?.uid || '');
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles file selection via input or drag-and-drop
   */
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    uploadFiles(fileArray);
  }, [uploadFiles]);

  /**
   * Handles drag over event
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /**
   * Handles drag leave event
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  /**
   * Handles drop event
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /**
   * Handles file input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Upload Media</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Files to Upload</CardTitle>
            <CardDescription>
              Supported formats: JPG, PNG, HEIC, WebP, MP4, MOV
              <br />
              <span className="text-destructive font-medium">
                Size limits: 500KB per photo, 700KB per video
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drag and drop files here</h3>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <label htmlFor="file-input">
                <Button asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/heic,image/webp,video/mp4,video/quicktime"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {uploads.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upload Progress</CardTitle>
                <CardDescription>{uploads.length} file(s) in queue</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompleted}
                disabled={!uploads.some(u => u.status === 'completed')}
              >
                Clear Completed
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploads.map((upload, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {upload.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {upload.status === 'error' && (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <span className="text-sm truncate">{upload.file.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">
                      {upload.status === 'uploading' && `${Math.round(upload.progress)}%`}
                      {upload.status === 'completed' && 'Complete'}
                      {upload.status === 'error' && 'Failed'}
                    </span>
                  </div>
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-2" />
                  )}
                  {upload.status === 'error' && upload.error && (
                    <p className="text-xs text-destructive">{upload.error}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
