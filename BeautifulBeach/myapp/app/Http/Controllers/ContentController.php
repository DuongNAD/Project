<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Content; 
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Services\ImageService;

class ContentController extends Controller
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
        try {
            return $this->response->json(true, data: Content::with('beach')->get(), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required | string',
                'body' => 'required | string',
                'beach_id' => 'required|integer|exists:beaches,id',
                'image' => 'required| image|mimes:jpg,jpeg,png|max:2048',
            ]);

            $content = new Content();
            $content->title = $request->title;
            $content->body = $request->body;
            $content->beach_id = $request->beach_id;
            $file = $request->file('image');
            $content->img_link = $this->imgSevice->upload($file, 'content');
            $content->save();

            return $this->response->json(
                true,
                'Add content success',
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
        try {
            return $this->response->json(true, data: Content::with('beach')->find($id), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $content = Content::findOrFail($id);

        try {
            $request->validate([
                'title' => 'sometimes | string',
                'body' => 'sometimes | string',
                'beach_id' => 'sometimes|integer|exists:beaches,id',
                'image' => 'sometimes| image|mimes:jpg,jpeg,png|max:2048',
            ]);

            if ($request->has('title')) {
                $content->title = $request->title;
            }
            if ($request->has('body')) {
                $content->body = $request->body;
            }
            if ($request->has('beach_id')) {
                $content->beach_id = $request->beach_id;
            }
            if ($request->has('image')) {
                $file = $request->file('image');
                $content->img_link = $this->imgSevice->upload($file, 'content');
            }
            $content->save();

            return $this->response->json(
                true,
                'Update content success',
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
        $content = Content::findOrFail($id);
        try {
            $content->delete();
            return $this->response->json(
                true,
                'Delete content success',
                status: 200
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
}