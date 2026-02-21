<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\PricingRule;
use App\Models\Tenant;
use App\Models\TeeTimeSlot;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Create a demo tenant (golf course)
        $tenant = Tenant::create([
            'slug'         => 'demo',
            'name'         => 'Pine Valley Golf Club',
            'logo_url'     => null,
            'colors'       => [
                'primary'   => '#1a7a3c',
                'secondary' => '#155e30',
                'accent'    => '#f0a500',
            ],
            'email'        => 'pro@pinevalley.demo',
            'phone'        => '(555) 867-5309',
            'is_active'    => true,
        ]);

        // Create the course info record
        Course::create([
            'tenant_id'   => $tenant->id,
            'name'        => 'Pine Valley Golf Club',
            'description' => 'A premier 18-hole championship course nestled among towering pines. Renowned for its challenging layout and immaculate greens.',
            'address'     => '1234 Fairway Drive',
            'city'        => 'Phoenix',
            'state'       => 'AZ',
            'zip'         => '85001',
            'phone'       => '(555) 867-5309',
            'email'       => 'pro@pinevalley.demo',
            'holes'       => 18,
            'par'         => 72,
            'amenities'   => ['Pro Shop', 'Driving Range', 'Putting Green', 'Restaurant', 'Club Rental'],
            'hours'       => [
                'Monday'   => '6:30 AM – 7:00 PM',
                'Tuesday'  => '6:30 AM – 7:00 PM',
                'Wednesday'=> '6:30 AM – 7:00 PM',
                'Thursday' => '6:30 AM – 7:00 PM',
                'Friday'   => '6:00 AM – 7:30 PM',
                'Saturday' => '5:30 AM – 8:00 PM',
                'Sunday'   => '5:30 AM – 8:00 PM',
            ],
        ]);

        // Create admin user for this tenant
        User::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Course Admin',
            'email'     => 'admin@pinevalley.demo',
            'password'  => Hash::make('password'),
            'role'      => 'admin',
        ]);

        // Create a golfer user
        User::create([
            'tenant_id' => $tenant->id,
            'name'      => 'Jane Golfer',
            'email'     => 'golfer@pinevalley.demo',
            'password'  => Hash::make('password'),
            'role'      => 'golfer',
        ]);

        // Add weekday and weekend pricing rules
        PricingRule::create([
            'tenant_id'        => $tenant->id,
            'name'             => 'Weekday Rate',
            'day_of_week'      => null,
            'price_per_player' => 65.00,
            'cart_fee'         => 18.00,
            'priority'         => 20,
        ]);

        PricingRule::create([
            'tenant_id'        => $tenant->id,
            'name'             => 'Weekend Rate',
            'day_of_week'      => 6, // Saturday
            'price_per_player' => 89.00,
            'cart_fee'         => 20.00,
            'priority'         => 10,
        ]);

        PricingRule::create([
            'tenant_id'        => $tenant->id,
            'name'             => 'Weekend Rate',
            'day_of_week'      => 0, // Sunday
            'price_per_player' => 89.00,
            'cart_fee'         => 20.00,
            'priority'         => 10,
        ]);

        // Seed tee times for the next 7 days (every 10 minutes, 7am-5pm)
        for ($dayOffset = 0; $dayOffset < 7; $dayOffset++) {
            $date = Carbon::today()->addDays($dayOffset);

            // Skip Mondays (simulate weekly maintenance day)
            if ($date->isMonday()) {
                continue;
            }

            $start = $date->copy()->setTime(7, 0);
            $end   = $date->copy()->setTime(17, 0);

            $current = $start->copy();
            while ($current->lte($end)) {
                // Weekend pricing
                $isWeekend   = $date->isWeekend();
                $price       = $isWeekend ? 89.00 : 65.00;
                $cartFee     = $isWeekend ? 20.00 : 18.00;

                TeeTimeSlot::create([
                    'tenant_id'        => $tenant->id,
                    'date'             => $date->format('Y-m-d'),
                    'start_time'       => $current->format('H:i:s'),
                    'max_players'      => 4,
                    'booked_players'   => 0,
                    'price_per_player' => $price,
                    'cart_fee'         => $cartFee,
                    'walking_allowed'  => true,
                    'is_available'     => true,
                ]);

                $current->addMinutes(10);
            }
        }

        $this->command->info('Demo tenant "Pine Valley Golf Club" seeded successfully.');
        $this->command->info('Admin login: admin@pinevalley.demo / password');
        $this->command->info('Golfer login: golfer@pinevalley.demo / password');
    }
}
