<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Services\ResponseService;
use Illuminate\Support\Facades\Hash;
use App\Services\ImageService;

class UpdateAccoutController extends Controller
{
    protected $response;
    protected $imgSevice;


    public function __construct(ResponseService $response, ImageService $imgSevice)
    {
        $this->middleware(['auth:sanctum', 'user.type:customer']);
        $this->response = $response;
        $this->imgSevice = $imgSevice;
    }
    public function index()
    {
        try {
            $id_accout  = Auth::user()->id;
            $account =  Account::findOrFail($id_accout);
            $account->makeHidden(['password']);
            return $this->response->json(
                true,
                data: $account,
                status: 200,
            );
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function update(Request $request)
    {
        $id_accout  = Auth::user()->id;
        $account =  Account::findOrFail($id_accout);
        try {
            $request->validate([
                'full_name' => 'sometimes|string',
                'email' => 'sometimes|string|unique:accounts,email,' . $account->id,
                'username' => 'sometimes|string|unique:accounts,username,' . $account->id,
                'phone' => 'sometimes|string|unique:accounts,phone,' . $account->id,
                'old_password' => 'nullable|required_with:password|string',
                'avata' => 'sometimes |image|mimes:jpg,jpeg,png|max:2048',

                'password' => 'sometimes|string|min:6',
                'gender' => 'sometimes|numeric|min:6',
                'birthday'  => 'sometimes|date|before:today',
            ]);
            if ($request->has('full_name')) {
                $account->full_name = $request->full_name;
            }
            if ($request->has('avata')) {
                $file = $request->file('avata');
                $account->avata  = $this->imgSevice->upload($file, 'account');
            }
            if ($request->has('email')) {
                $account->email = $request->email;
            }
            if ($request->has('username')) {
                $account->username = $request->username;
            }
            if ($request->has('phone')) {
                $account->phone = $request->phone;
            }
            if ($request->filled('password')) {
                if (!Hash::check($request->old_password, $account->password)) {
                    return $this->response->json(
                        false,
                        errors: 'Old password is not correct...',
                        status: 422,
                    );
                }
                $account->password = Hash::make($request->password);
            }
            if ($request->has('gender')) {
                $account->sex = $request->gender;
            }
            if ($request->has('birthday')) {
                $account->birthday = $request->birthday;
            }
            $account->save();
            return $this->response->json(
                true,
                'Update account success',
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
