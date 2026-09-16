<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\Course> */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->unique()->catchPhrase(),
            'description' => fake()->paragraph(4),
            'department' => fake()->randomElement(['IT Services', 'Policy & Research', 'Finance', 'Human Resources', 'Field Operations']),
            'duration' => fake()->randomElement(['2 hours', '4 hours', '1 day', '2 days', '1 week']),
            'level' => fake()->randomElement(['Beginner', 'Intermediate', 'Advanced']),
            'created_by' => User::factory()->admin(),
            'is_published' => true,
        ];
    }
}
