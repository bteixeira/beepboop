## sudo -u postgres createuser -P brains
## sudo -u postgres createdb -O brains beepboob
## psql -h localhost -U brains -d beepboob

## split -d -a 5 -l 85 out1.txt out1_


create table models (id serial);

alter table models add column name varchar(255);
alter table models add column dob date;
alter table models add column nationality varchar(255);
alter table models add column cup varchar(63);
alter table models add column "natural" boolean;
alter table models add column babepedia_slug varchar(255);

insert into models (name, dob, nationality, cup, enhanced) values ('TEST', null, 'NOWHERE', '40C', false);
delete from models where name = 'TEST';
