<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\SendInfoMail;
use App\Models\Account;
use Illuminate\Http\Request;
use App\Services\ResponseService;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendOtpMail;
use App\Services\ImageService;




class AccoutController extends Controller
{
    protected $response;
    protected $email;
    protected $imgSevice;

    public function __construct(ResponseService $response,   ImageService $imgSevice)
    {
        $this->response = $response;
        $this->imgSevice = $imgSevice;
    }

    public function index(Request $request)
    {
        try {
            $search  = $request->query("search");
            $rsSearchAccount  = Account::where('full_name', 'LIKE', '%' . $search . '%')
                ->orWhere('email', 'LIKE', "%{$search}%")
                ->orWhere('phone', 'LIKE', "%{$search}%")->get();
            return $this->response->json(true, data: !$search ? Account::all() : $rsSearchAccount, status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }
    public function permissionsAccout(Request $request)
    {
        try {
            $request->validate([
                'id_account' => 'required|integer|exists:accounts,id',
                'status' => 'required|in:0,1',
            ]);
            $account =  Account::findOrFail($request->id_account);
            $account->status = $request->status;
            $email  = $account->email;
            $username  = $account->username;
            $account->save();
            Mail::to($email)->send(new SendInfoMail($email, $request->status, $username));
            return $this->response->json(
                true,
                message: 'Update account ',
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

    public function store(Request $request)
    {
        try {
            $request->validate([
                'full_name' => 'required|string',
                'email' => 'required|string|unique:accounts,email',
                'username' => 'required|string|unique:accounts,username',
                'phone' => 'required|string|unique:accounts,phone',
                'password' => 'required|string|min:6',
                'gender' => 'required|numeric',
                'birthday'  => 'required|date|before:today',
                'image' => 'required| image|mimes:jpg,jpeg,png|max:2048',


            ]);
            $account = new Account();
            $account->full_name = $request->full_name;
            $account->email = $request->email;
            $account->username = $request->username;
            $account->phone = $request->phone;
            $account->birthday = $request->birthday;
            $account->sex = $request->gender;
            $this->email = $request->email;
            $account->password = Hash::make($request->password);
            $file = $request->file('image');
            $account->avatar  = $this->imgSevice->upload($file, 'account');
            $account->save();
            $otp = rand(100000, 999999);
            Cache::put('otp_' . $otp,  $request->email, now()->addMinutes(5));
            Mail::to($request->email)->send(new SendOtpMail($otp));
            return $this->response->json(
                true,
                message: 'OTP sent to email',
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
    public function verifyAccount(Request $request)
    {
        try {
            $request->validate([
                'otp' => 'required|numeric',
            ]);
            $email = Cache::get('otp_' . $request->otp);
            if (!$email) {
                return $this->response->json(
                    false,
                    errors: 'Invalid or expired OTP',
                    status: 400,
                );
            }
            $account  = Account::where('email',  $email)->first();
            $account->status = 1;
            $account->save();
            Cache::forget('otp_' . $request->otp);
            return $this->response->json(
                true,
                message: 'Account Verification Successfuly',
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
            return $this->response->json(true, data: Account::find($id), status: 200);
        } catch (\Throwable $th) {
            return $this->response->json(false, errors: $th->getMessage(), status: 500);
        }
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
}
