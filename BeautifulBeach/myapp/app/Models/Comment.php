<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id', 'beach_id', 'content_id', 'message', 'status'
    ];

    public function beaches()
    {
        return $this->belongsTo(Beach::class, 'beach_id');
    }

    public function content()
    {
        return $this->belongsTo(Content::class, 'content_id');
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id'); 
    }
}