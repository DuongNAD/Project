<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\ImageBeach;
use App\Models\Beach;

class ImageBeachFactory extends Factory
{
    protected $model = ImageBeach::class;

    public function definition(): array
    {
        // Danh sách ảnh biển chất lượng cao (HD) từ Unsplash
        // Anh có thể thêm bớt link tùy thích
        $beautifulBeaches = [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // Biển xanh cát trắng
            'https://images.unsplash.com/photo-1519046904884-53103b34b271?w=800&q=80', // Hàng dừa
            'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80', // Hoàng hôn
            'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80', // Sóng biển
            'https://images.unsplash.com/photo-1520116468816-95b69f847357?w=800&q=80', // Biển từ trên cao
            'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=800&q=80', // Resort
            'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&q=80', // Bãi đá
            'https://images.unsplash.com/photo-1537962231967-391ec8920d3d?w=800&q=80', // Bãi biển nhiệt đới
            'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80', // Maldives
            'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?w=800&q=80', // Đảo hoang
            'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80', // Thuyền trên biển
            'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80', // Lướt sóng
        ];

        return [
            // Chọn ngẫu nhiên 1 ảnh đẹp trong danh sách trên
            'img_link' => fake()->randomElement($beautifulBeaches),
            
            // Nếu tạo lẻ thì tự tạo luôn Beach mới
            'beach_id' => Beach::factory(),
        ];
    }
}