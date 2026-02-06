<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Content>
 */
class ContentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),        // Tự bịa tiêu đề
            'body' => fake()->paragraphs(3, true),// Tự bịa nội dung
            'beach_id' => \App\Models\Beach::factory(), // Tự tạo bãi biển gắn vào
            'img_link' => 'https://via.placeholder.com/640x480.png',
        ];
    }
}
