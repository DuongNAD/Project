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
        Schema::create('image_beaches', function (Blueprint $table) {
            $table->id();
            $table->string('img_link');
            $table->unsignedBigInteger('beach_id');
            $table->foreign('beach_id')->references('id')->on('beaches')->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_beaches');
    }
};
