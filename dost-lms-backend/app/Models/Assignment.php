<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    protected $primaryKey = 'assignment_id';

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'type',
        'quiz_questions',
        'due_date',
        'status',
        'max_score',
    ];

    protected $casts = [
        'quiz_questions' => 'array',
        'due_date' => 'date',
    ];

    public function isQuiz(): bool
    {
        return $this->type === 'quiz';
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'assignment_id', 'assignment_id');
    }

    /** Quiz questions with the correct answer stripped — safe to send to learners. */
    public function questionsForLearner(): array
    {
        return collect($this->quiz_questions ?? [])
            ->map(fn ($q) => [
                'question' => $q['question'] ?? '',
                'options' => $q['options'] ?? [],
            ])
            ->all();
    }
}
