<?php

namespace App\Models\Admin\JobSeekr;

use App\Scopes\TrashScope;
use GuzzleHttp\Psr7\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use  HasFactory;

    protected $table = 'jobseekr_jobs';
    protected $primaryKey = 'id';

    protected $fillable = [
        'comp_id',
        'title',
        'description',
        'category_id',
        'location',
        'salary',
        'job_type',
        'is_approved',
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

    public function approve($id)
    {

        $request = request();

        $action = $request->action;
        if ($action == 1) {
            $status = JOB_APPROVED;
        } else {

            $status = JOB_REJECTED;
        }
        $update_array = array(
            'is_approved' => $status
        );

        return $this->where('id', $id)->update($update_array);
    }

    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('jobseekr_jobs'));
    }
}
