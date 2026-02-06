<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Illuminate\Validation\ValidationException;


class CommentAdminController extends Controller
{
    protected $response;

    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }
    public function list()
    {
        try {
            return $this->response->json(true, data: Comment::with(['beaches', 'account', 'content'])->get(), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function blockComment(Request $request)
    {
        try {
            $request->validate([
                'id_comment' => 'required|integer|exists:comments,id',
                'status' => 'required|in:0,1',
            ]);
            $comment =  Comment::findOrFail($request->id_comment);
            $comment->status = $request->status;
            $comment->save();
            return $this->response->json(
                true,
                'update comment success',
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
}