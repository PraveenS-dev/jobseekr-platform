<?php

namespace App\Models;

use App\Scopes\TrashScope;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserExperience extends Model
{
    use  HasFactory;

    protected $table = 'user_experience';
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'company_name',
        'job_title',
        'start_date',
        'end_date',
        'description',
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

    public function updateExperience($userId, $request)
    {
        $submittedExperienceIds = $request->experience_ids ?? [];
        $experiences = $request->experiences ?? [];

        $existingExperiences = UserExperience::where('user_id', $userId)->where('status', 1)->get();
        $existingIds = $existingExperiences->pluck('id')->toArray();

        foreach ($existingIds as $existingId) {
            if (!in_array($existingId, $submittedExperienceIds)) {
                UserExperience::where('id', $existingId)->update([
                    'status' => 0,
                    'trash' => 'YES',
                    'updated_by' => Auth::id(),
                ]);
            }
        }

        foreach ($experiences as $index => $exp) {
            $submittedId = $submittedExperienceIds[$index] ?? null;

            $expData = [
                'user_id' => $userId,
                'company_name' => $exp['company_name'] ?? '',
                'job_title' => $exp['job_title'] ?? '',
                'start_date' => !empty($exp['start_date']) ? DBdateformat($exp['start_date']) : null,
                'end_date' => !empty($exp['end_date']) ? DBdateformat($exp['end_date']) : null,
                'description' => $exp['description'] ?? '',
            ];

            if ($submittedId) {
                $expData['updated_by'] = Auth::id();
                UserExperience::where('id', $submittedId)->update($expData);
            } else {
                $expData['created_by'] = Auth::id();
                $expData['status'] = 1;
                UserExperience::create($expData);
            }
        }

        return response()->json(['message' => 'Experience updated successfully.']);
    }

    public function SelectAll($id)
    {
        $data = $this->where('user_id', $id)->get();
        return $data;
    }

    protected static function booted()
    {
        static::addGlobalScope(new TrashScope('user_experience'));
    }
}
