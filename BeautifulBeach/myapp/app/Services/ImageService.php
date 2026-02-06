<?php
namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
class ImageService {
    public function upload($file  , $folder , $oldFile  = null )
    {
        if($oldFile) {
            $this->delete($oldFile);
        }
        $uploadPath = public_path("uploads/{$folder}");
        if (!File::exists($uploadPath)) {
            File::makeDirectory($uploadPath, 0777, true);
        }

        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();

        $file->move($uploadPath, $fileName);

        // Trả về link public
        return asset("uploads/{$folder}/{$fileName}");

    }
    public function delete($fileUrl)
    {

        $filePath = public_path(str_replace(asset('/'), '', $fileUrl));

        if (File::exists($filePath)) {
            File::delete($filePath);
        }
    }
}
?>