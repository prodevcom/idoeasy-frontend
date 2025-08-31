# Route 53 record for the main domain (idoeasy.net)
resource "aws_route53_record" "main_domain" {
  zone_id = "Z0741953HZTWCAUPOZTP" # idoeasy.net hosted zone
  name    = var.custom_domain
  type    = "A"

  alias {
    name                   = aws_apprunner_service.frontend.service_url
    zone_id                = "Z01915732ZBZKC8D32TPT" # App Runner hosted zone
    evaluate_target_health = true
  }

  depends_on = [aws_apprunner_service.frontend]
}

# Route 53 record for www subdomain (www.idoeasy.net)
resource "aws_route53_record" "www_subdomain" {
  zone_id = "Z0741953HZTWCAUPOZTP" # idoeasy.net hosted zone
  name    = "www.${var.custom_domain}"
  type    = "A"

  alias {
    name                   = aws_apprunner_service.frontend.service_url
    zone_id                = "Z01915732ZBZKC8D32TPT" # App Runner hosted zone
    evaluate_target_health = true
  }

  depends_on = [aws_apprunner_service.frontend]
}
