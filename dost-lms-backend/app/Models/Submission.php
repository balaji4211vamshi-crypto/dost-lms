<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $primaryKey = 'submission_id';

    protected $fillable = [
        'assignment_id',
        'user_id',
        'file_path',
        'notes',
        'quiz_answers',
        'score',
        'result',
        'submitted_at',
        'graded_at',
    ];

    protected $casts = [
        'quiz_answers' => 'array',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id', 'assignment_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
