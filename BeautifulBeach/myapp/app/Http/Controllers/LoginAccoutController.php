<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;


class LoginAccoutController extends Controller
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
                'email' => 'required | string',
                'password' => 'required',
            ]);
            $account = Account::where(function ($query) use ($request) {
                $query->where('username', $request->email)
                    ->orWhere('email', $request->email);
            })
                ->where('status', 1)
                ->first();
            if (!$account || ! Hash::check($request->password, $account->password)) {
                return $this->response->json(
                    false,
                    errors: 'The provided credentials are incorrect.',
                    status: 422,
                );
            }
            $token  = $account->createToken('account-token')->plainTextToken;
            $data = ['token' => $token, 'account' => $account->full_name, 'role' => 2];
            return $this->response->json(
                true,
                data: $data,
                status: 200,
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