<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Beach;
use App\Models\ImageBeach;
use App\Models\Account;
use App\Models\Region;
use App\Models\ImageBanner;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo Admin & User (Giữ nguyên)
        $this->call(UserSeeder::class);
        Account::factory(10)->create(); // Tạo 10 user thôi cho nhẹ

        // =============================================================
        // 👇 PHẦN QUAN TRỌNG: DANH SÁCH LINK ẢNH (Anh dán thêm vào đây)
        // =============================================================
        $gallery = [
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
            'https://images.unsplash.com/photo-1519046904884-53103b34b271?w=800&q=80',
            'https://images.unsplash.com/photo-1473116763249-56381a34c2b6?w=800&q=80',
            'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80',
            'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80',
            'https://images.unsplash.com/photo-1520942702018-08622ee79dd7?w=800&q=80',
            'https://images.unsplash.com/photo-1468413253771-d4f688052b17?w=800&q=80',
            'https://images.unsplash.com/photo-1537963447914-78f79f06e969?w=800&q=80',
            'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?w=800&q=80',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/1-14.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/2-15.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/3-13.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/4-15.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/5-9.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/6-4.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/8-4.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/9-3.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/10-3.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/11-3.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/14-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/15-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/16-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/17-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/18-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/19-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/20-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/21-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/22-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/23-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/24-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/25-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/26-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/27-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/28-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/30-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/31-2.jpg',
            'https://cellphones.com.vn/sforum/wp-content/uploads/2022/06/33-1.jpg',

        ];

        // 2. Tạo 5 Vùng (Region) trước
        // (Vì Bãi biển phải thuộc về một Vùng nào đó)
        $regions = Region::factory(5)->create();

        // 3. Duyệt qua từng Vùng để tạo Bãi biển
        foreach ($regions as $region) {
            
            // Tạo 4 bãi biển cho mỗi vùng
            $beaches = Beach::factory(4)->create([
                'region_id' => $region->id
            ]);

            // 4. Duyệt qua từng Bãi biển vừa tạo để GÁN ẢNH TỪ LIST TRÊN
            foreach ($beaches as $beach) {
                
                // Lấy ngẫu nhiên 3 link ảnh từ danh sách $gallery
                // (Dùng collect()->random() để lấy random không trùng lặp)
                $randomImages = collect($gallery)->random(3); 

                foreach ($randomImages as $url) {
                    ImageBeach::create([
                        'beach_id' => $beach->id,  // Gắn vào bãi biển hiện tại
                        'img_link' => $url,        // Link ảnh xịn
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}