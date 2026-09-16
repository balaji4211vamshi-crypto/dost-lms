<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_user_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Employee',
            'email' => 'test.employee@dost.gov.au',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonStructure(['user', 'token']);
        $this->assertDatabaseHas('users', ['email' => 'test.employee@dost.gov.au', 'role' => 'employee']);
    }

    public function test_registration_can_never_create_an_admin(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Sneaky User',
            'email' => 'sneaky@dost.gov.au',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'sneaky@dost.gov.au', 'role' => 'employee']);
    }

    public function test_a_user_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create(['email' => 'known@dost.gov.au', 'password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email' => 'known@dost.gov.au',
            'password' => 'password123',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'known2@dost.gov.au', 'password' => 'password123']);

        $response = $this->postJson('/api/login', [
            'email' => 'known2@dost.gov.au',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_guests_cannot_view_courses(): void
    {
        $this->getJson('/api/courses')->assertStatus(401);
    }

    public function test_an_employee_cannot_create_a_course(): void
    {
        $employee = User::factory()->create();

        $this->actingAs($employee, 'sanctum')
            ->postJson('/api/courses', ['title' => 'Hacked Course', 'level' => 'Beginner'])
            ->assertStatus(403);
    }

    public function test_an_admin_can_create_a_course(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/courses', ['title' => 'New Course', 'level' => 'Beginner'])
            ->assertCreated();
    }
}
