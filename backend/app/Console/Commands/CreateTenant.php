<?php

namespace App\Console\Commands;

use App\Models\Course;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateTenant extends Command
{
    // Command signature — all options have defaults so it can run interactively
    protected $signature = 'tenant:create
                            {--slug=         : URL slug (e.g. pine-valley)}
                            {--name=         : Full course name}
                            {--email=        : Admin email address}
                            {--password=     : Admin password (auto-generated if omitted)}
                            {--admin-name=   : Admin user display name}';

    protected $description = 'Provision a new golf course tenant and its admin user';

    public function handle(): int
    {
        $this->info('=== New Golf Course Provisioning ===');
        $this->newLine();

        // Collect values interactively if not passed as options
        $slug      = $this->option('slug')       ?: $this->ask('URL slug (lowercase, hyphens only — e.g. pine-valley)');
        $name      = $this->option('name')       ?: $this->ask('Course name (e.g. Pine Valley Golf Club)');
        $email     = $this->option('email')      ?: $this->ask('Admin email address');
        $adminName = $this->option('admin-name') ?: $this->ask('Admin display name', 'Course Admin');
        // Default to a simple temporary password — the admin will be forced to change it on login
        $password  = $this->option('password')   ?: 'TempPass1!';

        // Normalise slug — lowercase, no spaces
        $slug = Str::slug($slug);

        // Confirm before writing
        $this->newLine();
        $this->table(['Field', 'Value'], [
            ['Slug',       $slug],
            ['Name',       $name],
            ['Admin',      $adminName],
            ['Email',      $email],
            ['Password',   $password],
        ]);

        if (! $this->confirm('Create this tenant?', true)) {
            $this->warn('Aborted.');
            return self::FAILURE;
        }

        // Create the tenant row
        $tenant = Tenant::create([
            'slug'      => $slug,
            'name'      => $name,
            'is_active' => true,
        ]);

        // Create a bare-bones course record — admin fills in the rest via the admin panel
        Course::create([
            'tenant_id' => $tenant->id,
            'name'      => $name,
        ]);

        // Create the admin user tied to this tenant — flagged to change password on first login
        User::create([
            'tenant_id'            => $tenant->id,
            'name'                 => $adminName,
            'email'                => $email,
            'password'             => Hash::make($password),
            'role'                 => 'admin',
            'must_change_password' => true,
        ]);

        $this->newLine();
        $this->info('✅ Tenant created successfully!');
        $this->newLine();

        // Print the details the admin will need
        $this->table(['Detail', 'Value'], [
            ['Tenant ID',           $tenant->id],
            ['Slug',                $slug],
            ['Admin login URL',     '/admin/login'],
            ['Admin email',         $email],
            ['Temp password',       $password],
            ['Must change password','Yes — on first login'],
        ]);

        $this->newLine();
        $this->comment('Share the admin login URL, email, and temp password with the course manager.');
        $this->comment('They will be prompted to set a new password immediately after signing in.');
        $this->comment('They can then update course info, photos, and tee times from the admin panel.');

        return self::SUCCESS;
    }
}
