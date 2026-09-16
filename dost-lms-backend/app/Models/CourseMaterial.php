<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CourseMaterial extends Model
{
    protected $primaryKey = 'material_id';

    protected $fillable = [
        'course_id',
        'title',
        'type',
        'material_path',
        'original_filename',
        'size_bytes',
        'uploaded_by',
        'sort_order',
    ];

    /** Expose the computed download/stream URL on every JSON response (see getUrlAttribute below). */
    protected $appends = ['url'];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'user_id');
    }

    /**
     * Public URL for streaming/downloading via the "public" disk (Storage facade).
     * "link" materials already store a full external URL in material_path.
     */
    public function getUrlAttribute(): string
    {
        if ($this->type === 'link') {
            return $this->material_path;
        }

        return Storage::disk('public')->url($this->material_path);
    }
}
