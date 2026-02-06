<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ImageBanner;
use Illuminate\Http\Request;
use App\Services\ImageService;
use App\Services\ResponseService;
use Illuminate\Validation\ValidationException;

class ImageBannerController extends Controller
{

    protected $response;
    protected $imgSevice;

    public function __construct(ResponseService $response, ImageService $imgSevice)
    {
        $this->middleware(['auth:sanctum', 'user.type:admin']);
        $this->response = $response;
        $this->imgSevice = $imgSevice;
    }

    public function index()
    {
        return $this->response->json(true, data: ImageBanner::all(), status: 200);
    }


    public function store(Request $request)
    {

        try {
            $request->validate([    
                'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
                'type' => 'required|integer',
                'title' => 'required|string',
                'content' => 'required|string',
            ]);
            $imageBanner = new ImageBanner();
            $file = $request->file('image');
            $imageBanner->img  = $this->imgSevice->upload($file, 'content');
            $imageBanner->type = $request->type;
            $imageBanner->title = $request->title;
           $imageBanner->content = $request->input('content');


            $imageBanner->save();
            return $this->response->json(
                true,
                'Add Banner success',
                status: 200
            );
        } catch (ValidationException $th) {
            return $this->response->json(
                false,
                errors: $th->errors(),
                status: 422,
            );
        }
    }


    public function show(string $id)
    {
        //
    }


    public function update(Request $request, string $id)
    {
        $imgBanner =  ImageBanner::findOrFail($id);

        try {
            $request->validate([
                'image' => 'sometimes |image|mimes:jpg,jpeg,png|max:2048',
                'type' => 'sometimes|integer',
                'title' => 'sometimes|string',
                'content' => 'sometimes|string',

            ]);
            if ($request->has('image')) {
                $file = $request->file('image');
                $imgBanner->img  = $this->imgSevice->upload($file, 'content');
            }
            if ($request->has('type')) {
                $imgBanner->type = $request->type;
            }
            if ($request->has('title')) {
                $imgBanner->title = $request->title;
            }
            if ($request->has('content')) {
               $imgBanner->content = $request->input('content');
            }
            $imgBanner->save();
            return $this->response->json(
                true,
                'Update Banner success',
                status: 200
            );
        } catch (ValidationException $th) {
            return $this->response->json(
                false,
                errors: $th->errors(),
                status: 422,
            );
        }
    }


    public function destroy(string $id)
    {
        $imgBanner =  ImageBanner::findOrFail($id);
        try {
            $imgBanner->delete();
            return $this->response->json(
                true,
                'Delete Image Banner success',
                status: 200
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
}
