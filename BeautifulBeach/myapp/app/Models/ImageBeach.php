<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageBeach extends Model
{
    use HasFactory;

    protected $table = 'image_beaches';

    protected $guarded = [];

    public function beach()
    {
        return $this->belongsTo(Beach::class);
    }
}