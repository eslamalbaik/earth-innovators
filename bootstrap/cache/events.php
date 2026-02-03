<?php return array (
  'Illuminate\\Foundation\\Support\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\CommentAdded' => 
    array (
      0 => 'App\\Listeners\\HandleCommentAdded@handle',
    ),
    'App\\Events\\EvaluationCreated' => 
    array (
      0 => 'App\\Listeners\\HandleEvaluationCreated@handle',
    ),
    'App\\Events\\EvaluationUpdated' => 
    array (
      0 => 'App\\Listeners\\HandleEvaluationUpdated@handle',
    ),
    'App\\Events\\StatusChanged' => 
    array (
      0 => 'App\\Listeners\\HandleStatusChanged@handle',
    ),
    'App\\Events\\SubmissionCreated' => 
    array (
      0 => 'App\\Listeners\\HandleSubmissionCreated@handle',
    ),
    'App\\Events\\ArticleApproved' => 
    array (
      0 => 'App\\Listeners\\SendArticleApprovedNotification@handle',
    ),
    'App\\Events\\BadgeGranted' => 
    array (
      0 => 'App\\Listeners\\SendBadgeGrantedNotification@handle',
    ),
    'App\\Events\\CertificateIssued' => 
    array (
      0 => 'App\\Listeners\\SendCertificateIssuedNotification@handle',
    ),
    'App\\Events\\ChallengeCreated' => 
    array (
      0 => 'App\\Listeners\\SendChallengeCreatedNotification@handle',
    ),
    'App\\Events\\ProjectApproved' => 
    array (
      0 => 'App\\Listeners\\SendProjectApprovedNotification@handle',
    ),
    'App\\Events\\ProjectEvaluated' => 
    array (
      0 => 'App\\Listeners\\SendProjectEvaluatedNotification@handle',
    ),
    'App\\Events\\ProjectRejected' => 
    array (
      0 => 'App\\Listeners\\SendProjectRejectedNotification@handle',
    ),
    'App\\Events\\StudentSubmissionUpdated' => 
    array (
      0 => 'App\\Listeners\\SendStudentSubmissionUpdatedNotification@handle',
    ),
    'App\\Events\\ChallengeSubmissionReviewed' => 
    array (
      0 => 'App\\Listeners\\SendSubmissionReviewNotification@handle',
    ),
    'App\\Events\\TeacherProjectCreated' => 
    array (
      0 => 'App\\Listeners\\SendTeacherProjectCreatedNotification@handle',
    ),
  ),
);