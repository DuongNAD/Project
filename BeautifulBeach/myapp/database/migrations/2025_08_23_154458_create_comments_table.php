<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->string('message');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('beach_id');
            $table->unsignedBigInteger('content_id');
            $table->integer('status');
            $table->foreign('content_id')->references('id')->on('contents');
            $table->foreign('account_id')->references('id')->on('accounts');
            $table->foreign('beach_id')->references('id')->on('beaches');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};