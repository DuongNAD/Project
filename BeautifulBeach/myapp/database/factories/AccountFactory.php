<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    public function definition(): array
    {
        // Danh sách ảnh đại diện (Avatar) đẹp
        $avatars = [
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop', // Nam
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', // Nữ
            'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop', // Nam
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', // Nữ
            'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop', // Nam
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', // Nữ
            'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop', // Nam
        ];

        return [
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'username' => fake()->unique()->userName(),
            'phone' => fake()->phoneNumber(),
            'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'birthday' => fake()->date(),
            'status' => 1,
            'sex' => fake()->randomElement(['Nam', 'Nữ']),
            
            // 👇 Sửa dòng này: Dùng randomElement thay vì link loremflickr cũ
            'avatar' => fake()->randomElement($avatars), 
        ];
    }
}