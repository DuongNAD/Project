<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 👇 THÊM ĐOẠN NÀY ĐỂ VS CODE HẾT BÁO LỖI
 * @property string $content
 * @property string $title
 * @property int $type
 * @property string $img
 */
class ImageBanner extends Model
{
    use HasFactory;
    
    protected $guarded = [];
}