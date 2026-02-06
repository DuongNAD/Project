<?php

namespace App\Services;

class ResponseService
{
    public function json($success, $message = '', $data = null, $errors = null, $status = 200)
    {
        $response =  [
            'status' => $success
        ];
        if ($success) {
            $response['message'] = $message;
            $response['data'] = $data;
        } else {
            $response['errors'] = $errors;
        }
        return response()->json($response, $status);
    }
}