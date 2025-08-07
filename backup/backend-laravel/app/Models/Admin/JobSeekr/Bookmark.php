<?php

namespace App\Models\Admin\JobSeekr;

use App\Scopes\TrashScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Bookmark extends Model
{
    use  HasFactory;

    protected $table = 'jobseekr_book_marks';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'job_id',
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

    public function store()
    {
        $request = request();
        $insertArray = array(
            'user_id' => Auth::id(),
            'job_id' => $request->job_id,
            'created_by' => Auth::id(),
        );

        return $this->create($insertArray);
    }

    public function remove($id)
    {
        $insertArray = array(
            'status' => 0,
            'trash' => 'YES',
        );

        return $this->where('job_id', $id)->update($insertArray);
    }

    public function getdata()
    {
        return $this->where('user_id', Auth::id())->get();
    }

    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('jobseekr_book_marks'));
    }
}
