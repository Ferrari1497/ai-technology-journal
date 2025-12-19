output "prod_bucket_name" {
  description = "Name of the production S3 bucket"
  value       = aws_s3_bucket.prod_bucket.id
}

output "staging_bucket_name" {
  description = "Name of the staging S3 bucket"
  value       = aws_s3_bucket.staging_bucket.id
}

output "prod_website_url" {
  description = "Production website URL"
  value       = "http://${aws_s3_bucket.prod_bucket.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}

output "staging_website_url" {
  description = "Staging website URL"
  value       = "http://${aws_s3_bucket.staging_bucket.bucket}.s3-website-${var.aws_region}.amazonaws.com"
}