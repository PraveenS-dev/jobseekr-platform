<?php

namespace App\Models\Admin\JobSeekr;

use App\Scopes\TrashScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use  HasFactory;

    protected $table = 'jobseekr_categories';
    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'created_by',
        'updated_by',
        'status',
        'trash',
        'created_at',
        'updated_at'
    ];

    protected $attributes = [
        'status' => 1,
        'trash' => 'NO',
    ];

    public function jobs()
    {
        return $this->hasMany(Job::class, 'category_id', 'id');
    }


    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('jobseekr_categories'));
    }
}
