<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    // 👇 1. THÊM HÀM NÀY ĐỂ LẤY DANH SÁCH COMMENT + INFO USER
    public function index(Request $request)
    {
        try {
            // Lấy beach_id từ tham số gửi lên (VD: ?id=1)
            $beach_id = $request->input('id') ?? $request->input('beach_id');

            if (!$beach_id) {
                return response()->json(['data' => []]);
            }

            $comments = Comment::with('account') // ✅ Quan trọng: Lấy kèm thông tin User
                        ->where('beach_id', $beach_id)
                        ->orderBy('created_at', 'desc') // Mới nhất lên đầu
                        ->get();

            return response()->json([
                'status'  => 200,
                'success' => true,
                'data'    => $comments
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => 500, 'message' => $e->getMessage()], 500);
        }
    }

    // 👇 2. CÁC HÀM CŨ CỦA ANH (GIỮ NGUYÊN)
    public function store(Request $request)
    {
        try {
            $request->validate([
                'beach_id' => 'required|integer|exists:beaches,id',
                'message'  => 'required|string',
            ]);

            $user = auth('sanctum')->user();
            if (!$user) $user = auth('api')->user();

            if (!$user) {
                return response()->json([
                    'status'  => 401,
                    'message' => 'Bạn cần đăng nhập để thực hiện chức năng này.'
                ], 401);
            }

            $comment = new Comment();
            $comment->account_id = $user->id;
            $comment->status     = 1;
            $comment->message    = $request->message;
            $comment->beach_id   = $request->beach_id;
            
            // Fix lỗi content_id
            $comment->content_id = $request->input('content_id');

            $comment->save();

            return response()->json([
                'status'  => 200,
                'message' => 'Add comment success',
                'success' => true
            ], 200);

        } catch (ValidationException $th) {
            return response()->json([
                'status'  => 422,
                'success' => false,
                'errors'  => $th->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 500,
                'success' => false,
                'message' => 'Server Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $user = auth('sanctum')->user();
            if (!$user) $user = auth('api')->user();

            if (!$user) {
                return response()->json(['status' => 401, 'message' => 'Unauthorized'], 401);
            }

            $comment = Comment::findOrFail($id);

            if ($comment->account_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'errors'  => 'No permission to edit comments',
                    'status'  => 403,
                ], 403);
            }

            $request->validate([
                'message' => 'required|string',
            ]);

            $comment->message = $request->message;
            $comment->save();

            return response()->json([
                'success' => true,
                'message' => 'Update comment success',
                'status'  => 200
            ], 200);

        } catch (ValidationException $th) {
            return response()->json([
                'success' => false,
                'errors'  => $th->errors(),
                'status'  => 422,
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'status'  => 500,
            ], 500);
        }
    }

    public function delete($id)
    {
        try {
            $user = auth('sanctum')->user();
            if (!$user) $user = auth('api')->user();

            if (!$user) {
                return response()->json(['status' => 401, 'message' => 'Unauthorized'], 401);
            }

            $comment = Comment::findOrFail($id);

            if ($comment->account_id != $user->id) {
                return response()->json([
                    'success' => false,
                    'errors'  => 'No permission to delete comments',
                    'status'  => 403,
                ], 403);
            }

            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Delete comment success',
                'status'  => 200
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors'  => $e->getMessage(),
                'status'  => 500, 
            ], 500);
        }
    }
}