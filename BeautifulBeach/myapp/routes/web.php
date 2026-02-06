<?php

use Illuminate\Support\Facades\Route;
use App\Models\Beach;
use App\Models\Account;

// Khi vào trang chủ '/', thực hiện hành động sau:
Route::get('/', function () {
    // 1. Lấy thử 5 bãi biển từ Database
    $beaches = Beach::take(5)->get();
    
    // 2. Lấy thử 5 tài khoản từ Database
    $accounts = Account::take(5)->get();

    // 3. Trả về kết quả dạng chữ để xem nhanh
    return [
        'Thông báo' => 'Chúc mừng! Kết nối Database thành công!',
        'Danh sách bãi biển' => $beaches,
        'Danh sách tài khoản' => $accounts
    ];
});