<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    protected $response;
    public function __construct(ResponseService $response)
    {
        $this->response = $response;
    }
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required | email',
                'password' => 'required',
            ]);
        } catch (ValidationException $th) {
            return $this->response->json(
                false,
                errors: $th->errors(),
                status: 422,
            );
        }
        $user  = User::where('email', $request->email)->first();
        if (!$user || ! Hash::check($request->password, $user->password)) {
            return $this->response->json(
                false,
                errors: 'The provided credentials are incorrect.',
                status: 422,
            );
        }
        $token  = $user->createToken('api-token')->plainTextToken;
        $data = ['token' => $token, 'role' => 1];
        return $this->response->json(
            true,
            data: $data,
            status: 200,
        );
    }
}
