<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorites extends Model
{
    use HasFactory;
    public function beaches()
    {

        return $this->belongsTo(Beach::class, 'beach_id');
    }
}