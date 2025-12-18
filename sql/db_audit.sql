use `y9_v2.2.3`;

UPDATE `y9_v2.2.3`.`projects` SET `project_total_empl_cost` = '0.0' WHERE (`project_id` = '1363');

/* audit invoices */
select t1.project_name, t1.project_total_purchases from projects t1
group by t1.project_name
having t1.project_total_purchases !=  (select sum(t2.invoice_amount) from invoices t2 where t1.project_name = t2.project_number);

/* audit payments */
select t1.project_name, t1.project_total_payments from projects t1
group by t1.project_name
having t1.project_total_payments !=  (select sum(t2.payment_amount) from payments t2 where t1.project_name = t2.project_number);

/* audit contrct cost */
select t1.project_name, t1.project_total_cntrc_cost from projects t1
group by t1.project_name
having t1.project_total_cntrc_cost != (select sum(t2.payment_amount) from contractor_jobs t2 where t1.project_name = t2.project_number);

/* audit employee cost */
select t1.project_name, t1.project_total_empl_cost from projects t1
group by t1.project_name
having t1.project_total_empl_cost = (select sum(t2.labor_cost) from employee_jobs t2 where t1.project_name = t2.project_number);


select count(*) from projects where  project_total_empl_cost > 0