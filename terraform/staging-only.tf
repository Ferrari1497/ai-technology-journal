# 検証環境のみの設定
resource "aws_s3_bucket" "staging_only" {
  bucket = var.staging_bucket_name
}

resource "aws_s3_bucket_website_configuration" "staging_only_website" {
  bucket = aws_s3_bucket.staging_only.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

resource "aws_s3_bucket_public_access_block" "staging_only_pab" {
  bucket = aws_s3_bucket.staging_only.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "staging_only_policy" {
  bucket = aws_s3_bucket.staging_only.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.staging_only.arn}/*"
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.staging_only_pab]
}

output "staging_only_bucket_name" {
  value = aws_s3_bucket.staging_only.id
}

output "staging_only_website_url" {
  value = aws_s3_bucket_website_configuration.staging_only_website.website_endpoint
}
