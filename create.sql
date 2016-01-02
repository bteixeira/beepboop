## sudo -u postgres createuser -P brains
## sudo -u postgres createdb -O brains beepboob
## psql -h localhost -U brains -d beepboob

create table models (id serial);

alter table models add column name varchar(255);
alter table models add column dob date;
alter table models add column nationality varchar(255);
alter table models add column cup varchar(63);
alter table models add column enhanced boolean;

insert into models (name, dob, nationality, cup, enhanced) values ('TEST', null, 'NOWHERE', '40C', false);
delete from models where name = 'TEST';
