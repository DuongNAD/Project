<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beach extends Model
{
    use HasFactory;

    protected $table = 'beaches';
    protected $fillable = [
        'name',
        'description',
        'location',
        'latitude',
        'longitude',
        'region_id'
    ];

    public function images()
    {
        return $this->hasMany(ImageBeach::class, 'beach_id');
    }

    public function region()
    {
        return $this->belongsTo(Region::class, 'region_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'beach_id');
    }

    public function favorites()
    {
        return $this->hasMany(Favorites::class, 'beach_id');
    }
}