<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jobseekr_jobs', function (Blueprint $table) {
            $table->foreign(['category_id'], 'fk_jobseekr_jobs_category_id')->references(['id'])->on('jobseekr_categories')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jobseekr_jobs', function (Blueprint $table) {
            $table->dropForeign('fk_jobseekr_jobs_category_id');
        });
    }
};
