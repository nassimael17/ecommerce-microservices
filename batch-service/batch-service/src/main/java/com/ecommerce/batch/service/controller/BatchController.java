package com.ecommerce.batch.service.controller;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batch")
public class BatchController {

  private final JobLauncher launcher;
  private final Job nightlyOrdersJob;

  public BatchController(JobLauncher launcher, Job nightlyOrdersJob) {
    this.launcher = launcher;
    this.nightlyOrdersJob = nightlyOrdersJob;
  }

  @PostMapping("/run")
  public String run() throws Exception {
    launcher.run(nightlyOrdersJob,
      new JobParametersBuilder().addLong("time", System.currentTimeMillis()).toJobParameters()
    );
    return "Batch triggered ✅";
  }
}

