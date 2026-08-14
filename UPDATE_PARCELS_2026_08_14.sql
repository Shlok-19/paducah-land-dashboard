-- Paducah Land Dashboard parcel refresh from Paducah Land(1).kmz
-- Run once in Supabase Dashboard > SQL Editor.
-- Existing status, price, and notes are preserved; owner/acres are refreshed and new parcels are inserted.

insert into public.parcels (id, owner, acres, status)
values
('P01','Riley, Clifton and Mary Lou',1.04,'Pending'),
('P02','Rickman, Gregory',1.19,'Pending'),
('P03','Nichols Charles',4.46,'Pending'),
('P04','McReynolds,Clifton and Joy',1.35,'Pending'),
('P05','Broadway, Christine',0.51,'Pending'),
('P06','Horner, J H Jr',2.86,'Pending'),
('P07','French Kimberly',0.64,'Pending'),
('P08','Tynes Robert & MelissaS',0.50,'Pending'),
('P09','Tracy Angela',1.10,'Pending'),
('P10','Riley,Billy G and Deborah N',1.96,'Pending'),
('P11','Wilson, Lamar D',0.83,'Pending'),
('P12','Kegler, Emmanuel and Jennifer',1.31,'Pending'),
('P13','Booher, Evelyn Louise Estate',3.73,'Pending'),
('P14','GPED Land',682.14,'Pending'),
('P15','GPED Land',29.92,'Pending'),
('P16','Campbell',16.27,'Pending'),
('P17','Labes LLC',152.29,'Pending'),
('P18','Labes LLC',57.11,'Pending'),
('P19','Smith Contracting',90.35,'Pending'),
('P20','Rickman Matthew & Ashley',0.59,'Pending'),
('P21','French Raymond and Kimberly',0.50,'Pending'),
('P22','Campbell',29.21,'Pending'),
('P23','Grantham Ted R',4.07,'Pending'),
('P24','MCELYA WILLIAM ESTATE',0.86,'Pending')
on conflict (id) do update
set owner = excluded.owner,
    acres = excluded.acres;
