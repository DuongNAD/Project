<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Beach;
use App\Models\Favorites;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class FavoritesController extends Controller
{
    protected $response;

    public function __construct(ResponseService $response)
    {
        $this->middleware(['auth:sanctum', 'user.type:customer']);
        $this->response = $response;
    }
    public function index()
    {
        $account  = Auth::user()->id;
        try {
            $id_beach = Favorites::with('beach')->where('account_id',  $account)->pluck('beach_id');
            return $this->response->json(true, data: Beach::with(['images', 'region'])->withCount([
                'comments as comments_count' => function ($query) {
                    $query->where('status', 1);
                },
                'favorites'
            ])->whereIn('id', $id_beach)->get(), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function store(Request $request)
    {
        $account  = Auth::user()->id;

        try {
            $request->validate([
                'beach_id' => 'required|integer|exists:beaches,id',
            ]);
            $favorite = new Favorites();
            $favorite->account_id = $account;
            $favorite->beach_id = $request->beach_id;
            $favorite->save();
            return $this->response->json(
                true,
                'Add favorite success',
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
    public function delete(Request $request)
    {
        $account  = Auth::user()->id;
        $id_beach =  $request->query('beach_id');

        try {
            $favorite = Favorites::where('beach_id', $id_beach)->where('account_id', $account)->first();
            $favorite->delete();
            return $this->response->json(
                true,
                'Delete favorite success',
                status: 200
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function checkfavorites(Request $request)
    {
        $account  = Auth::user()->id;
        $id_beach =  $request->query('beach_id');
        $favorite = Favorites::where('beach_id', $id_beach)->where('account_id', $account)->first();
        if ($favorite) {
            return $this->response->json(
                true,
                message: true,
                status: 200
            );
        }
        return $this->response->json(
            true,
            message: false,
            status: 200
        );

        try {

        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
}
