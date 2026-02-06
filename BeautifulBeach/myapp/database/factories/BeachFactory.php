<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Beach>
 */
class BeachFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->streetName() . ' Beach', // Tên bãi biển
            'description' => fake()->paragraph(2),      // Mô tả ngắn
            'location' => fake()->address(),            // Địa chỉ
            'region_id' => \App\Models\Region::factory(), 
            'latitude' => fake()->latitude(),   // Tự sinh vĩ độ
            'longitude' => fake()->longitude(),
        ];
    }
}
