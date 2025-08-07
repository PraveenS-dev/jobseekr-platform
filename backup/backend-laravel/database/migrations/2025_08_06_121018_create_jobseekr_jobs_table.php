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
        Schema::create('jobseekr_jobs', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('comp_id');
            $table->string('title');
            $table->text('description');
            $table->integer('category_id')->index('fk_jobseekr_jobs_category_id');
            $table->string('location', 50);
            $table->string('salary', 100);
            $table->string('job_type', 30);
            $table->string('is_approved', 30);
            $table->integer('created_by');
            $table->integer('updated_by')->nullable();
            $table->dateTime('created_at')->nullable()->useCurrent();
            $table->dateTime('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
            $table->integer('status')->nullable()->default(1);
            $table->enum('trash', ['NO', 'YES'])->nullable()->default('NO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobseekr_jobs');
    }
};
