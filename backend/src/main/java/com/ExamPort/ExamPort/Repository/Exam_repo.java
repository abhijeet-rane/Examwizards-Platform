package com.ExamPort.ExamPort.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ExamPort.ExamPort.Entity.Exam;


public interface Exam_repo extends JpaRepository<Exam, Long>{
    /**
     * Row count only; does not load Exam -> Question associations (those can trigger mapping/SQL errors).
     */
    @Query(value = "SELECT COUNT(*) FROM exam WHERE course_id = :courseId", nativeQuery = true)
    Long countByCourseNative(@Param("courseId") Long courseId);

    // Find exams by instructor id (via course)
    List<Exam> findByCourse_Instructor_Id(Long instructorId);
    
    // Find exams by course id
    List<Exam> findByCourse_Id(Long courseId);
    
    // Find exams by course id (alternative naming)
    List<Exam> findByCourseId(Long courseId);
}
