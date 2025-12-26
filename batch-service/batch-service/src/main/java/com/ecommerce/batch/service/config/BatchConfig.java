package com.ecommerce.batch.service.config;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
public class BatchConfig {

  @Bean
  public Step nightlyStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
    return new StepBuilder("nightlyStep", jobRepository)
      .tasklet((contribution, chunkContext) -> {
        System.out.println("✅ Nightly batch executed (placeholder for pending orders processing)");
        return RepeatStatus.FINISHED;
      }, txManager)
      .build();
  }

  @Bean
  public Job nightlyOrdersJob(JobRepository jobRepository, Step nightlyStep) {
    return new JobBuilder("nightlyOrdersJob", jobRepository)
      .start(nightlyStep)
      .build();
  }
}

